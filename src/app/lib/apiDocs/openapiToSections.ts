/**
 * Maps FastAPI OpenAPI 3.x into grouped sections for /api-docs.
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type AuthBadge = 'public' | 'patient' | 'radiologist' | 'admin' | 'any';

export interface ApiDocEndpoint {
  method: HttpMethod;
  path: string;
  summary: string;
  auth: AuthBadge;
  body?: string;
  response: string;
  notes?: string;
  params?: string;
}

export interface ApiDocSection {
  id: string;
  title: string;
  color: string;
  endpoints: ApiDocEndpoint[];
}

export const GROUP_ORDER = [
  'auth',
  'scan',
  'patient',
  'shared',
  'radiologist-dicom',
  'pacs',
  'cabinet',
  'admin',
  'gdpr',
  'jobs',
] as const;

export type GroupId = (typeof GROUP_ORDER)[number];

type Json = Record<string, unknown>;

function pathToGroupId(path: string): GroupId | 'other' {
  if (path.startsWith('/api/auth')) return 'auth';
  if (path.startsWith('/api/scan')) return 'scan';
  if (path.startsWith('/api/patient')) return 'patient';
  if (path.startsWith('/api/shared')) return 'shared';
  if (path.startsWith('/api/radiologist/pacs')) return 'pacs';
  if (path.startsWith('/api/radiologist')) {
    if (
      path.includes('/lab') ||
      path.includes('/profile') ||
      path.includes('/storage-quota')
    ) {
      return 'cabinet';
    }
    return 'radiologist-dicom';
  }
  if (path.startsWith('/api/admin')) return 'admin';
  if (path.startsWith('/api/gdpr')) return 'gdpr';
  if (path.startsWith('/api/jobs')) return 'jobs';
  return 'other';
}

function inferAuth(path: string, method: HttpMethod): AuthBadge {
  const p = path.toLowerCase();
  if (p === '/health') return 'public';
  if (p.startsWith('/api/shared/')) return 'public';
  if (
    p === '/api/auth/login' ||
    p === '/api/auth/register' ||
    p === '/api/auth/admin/login' ||
    p === '/api/auth/forgot-password' ||
    p === '/api/auth/refresh'
  ) {
    return 'public';
  }
  if (p.startsWith('/api/auth/')) return 'any';
  if (p.startsWith('/api/scan/quota')) return 'patient';
  if (p.startsWith('/api/scan/')) return 'any';
  if (p.startsWith('/api/patient/')) return 'patient';
  if (p.startsWith('/api/radiologist/')) return 'radiologist';
  if (p.startsWith('/api/admin/')) return 'admin';
  if (p.startsWith('/api/gdpr/')) return 'any';
  if (p.startsWith('/api/jobs/')) return 'any';
  return 'any';
}

function refName(ref: string): string {
  const parts = ref.split('/');
  return parts[parts.length - 1] || ref;
}

function schemaSnippet(schema: unknown, depth: number): string {
  if (depth > 5) return '{ ... }';
  if (!schema || typeof schema !== 'object') return '{}';
  const s = schema as Json;
  if (typeof s.$ref === 'string') {
    return `/* ${refName(s.$ref)} */`;
  }
  if (Array.isArray(s.enum)) {
    return JSON.stringify(s.enum, null, 2);
  }
  if (s.type === 'object' && s.properties && typeof s.properties === 'object') {
    const props = s.properties as Record<string, Json>;
    const lines: string[] = ['{'];
    for (const [k, v] of Object.entries(props)) {
      const opt = Array.isArray(s.required) && !s.required.includes(k) ? '?' : '';
      const inner = schemaSnippet(v, depth + 1).replace(/\n/g, '\n  ');
      lines.push(`  "${k}"${opt}: ${inner},`);
    }
    lines.push('}');
    return lines.join('\n');
  }
  if (s.type === 'array' && s.items) {
    return `[\n  ${schemaSnippet(s.items, depth + 1)}\n]`;
  }
  if (typeof s.type === 'string') {
    return `"<${s.type}>"`;
  }
  return JSON.stringify(s, null, 2).slice(0, 1200);
}

function pickJsonContent(media?: Record<string, Json>): Json | null {
  if (!media) return null;
  return (
    (media['application/json'] as Json | undefined) ||
    (media['multipart/form-data'] as Json | undefined) ||
    null
  );
}

function extractBodyExample(op: Json): string | undefined {
  const body = op.requestBody as Json | undefined;
  if (!body || typeof body !== 'object') return undefined;
  const content = pickJsonContent(body.content as Record<string, Json>);
  if (!content) return undefined;
  if (content.example) {
    return JSON.stringify(content.example, null, 2);
  }
  if (content.schema) {
    return schemaSnippet(content.schema, 0);
  }
  return undefined;
}

function extractResponseExample(op: Json): string {
  const responses = op.responses as Record<string, Json> | undefined;
  if (!responses) return '{}';
  const res =
    responses['200'] || responses['201'] || responses['202'] || responses['204'] || responses.default;
  if (!res || typeof res !== 'object') return '{}';
  const content = pickJsonContent(res.content as Record<string, Json>);
  if (!content) {
    if (res.description && typeof res.description === 'string') {
      return `// ${res.description}`;
    }
    return '{}';
  }
  if (content.example) {
    return JSON.stringify(content.example, null, 2);
  }
  if (content.schema) {
    return schemaSnippet(content.schema, 0);
  }
  return '{}';
}

function extractQueryParams(pathItem: Json, op: Json): string | undefined {
  const all = [...((pathItem.parameters as Json[]) || []), ...((op.parameters as Json[]) || [])];
  const query = all.filter(p => p && p.in === 'query');
  if (!query.length) return undefined;
  const lines = query.map(
    p =>
      `${String(p.name)}${p.required ? '' : '?'}: ${(p.schema as Json)?.type || 'string'}  // ${String(p.description || '')}`
  );
  return lines.join('\n');
}

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export function buildSectionsFromOpenApi(spec: Json): ApiDocSection[] {
  const paths = (spec.paths || {}) as Record<string, Json>;
  const buckets: Record<GroupId, ApiDocEndpoint[]> = {
    auth: [],
    scan: [],
    patient: [],
    shared: [],
    'radiologist-dicom': [],
    pacs: [],
    cabinet: [],
    admin: [],
    gdpr: [],
    jobs: [],
  };

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!pathItem || typeof pathItem !== 'object') continue;
    const group = pathToGroupId(path);
    if (group === 'other') continue;

    for (const m of METHODS) {
      const key = m.toLowerCase();
      const op = pathItem[key];
      if (!op || typeof op !== 'object') continue;
      const summary =
        (typeof op.summary === 'string' && op.summary) ||
        (typeof op.operationId === 'string' && op.operationId) ||
        `${m} ${path}`;
      const desc = typeof op.description === 'string' ? op.description : undefined;
      const notes = [desc, Array.isArray(op.tags) ? `Tags: ${op.tags.join(', ')}` : undefined]
        .filter(Boolean)
        .join('\n\n');

      buckets[group].push({
        method: m,
        path,
        summary,
        auth: inferAuth(path, m),
        body: extractBodyExample(op),
        response: extractResponseExample(op),
        notes: notes || undefined,
        params: extractQueryParams(pathItem, op),
      });
    }
  }

  const titles: Record<GroupId, string> = {
    auth: 'AUTH — Authentification',
    scan: 'SCAN IA',
    patient: 'PATIENT DOCUMENTS',
    shared: 'PARTAGE',
    'radiologist-dicom': 'RADIOLOGUE — DICOM & rapports',
    pacs: 'PACS',
    cabinet: 'CABINET & profil radiologue',
    admin: 'ADMIN',
    gdpr: 'RGPD',
    jobs: 'JOBS',
  };

  const colors: Record<GroupId, string> = {
    auth: 'from-slate-600 to-slate-800',
    scan: 'from-violet-600 to-violet-800',
    patient: 'from-blue-600 to-blue-800',
    shared: 'from-rose-600 to-rose-800',
    'radiologist-dicom': 'from-indigo-600 to-indigo-900',
    pacs: 'from-cyan-600 to-cyan-800',
    cabinet: 'from-purple-600 to-purple-800',
    admin: 'from-red-600 to-red-900',
    gdpr: 'from-emerald-600 to-emerald-900',
    jobs: 'from-amber-600 to-amber-800',
  };

  return GROUP_ORDER.map(id => ({
    id,
    title: titles[id],
    color: colors[id],
    endpoints: buckets[id].sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method)),
  }));
}
