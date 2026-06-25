import { useState } from 'react';
import {
  Server, Database, Cloud, Lock, Zap, Brain, FileText,
  Users, Activity, Shield, TrendingUp, Code, Layers
} from 'lucide-react';

export function SystemArchitecture() {
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

  const layers = [
    {
      id: 'frontend',
      title: 'Couche Frontend',
      color: 'from-blue-500 to-blue-600',
      icon: <Code className="w-6 h-6" />,
      components: [
        { name: 'React SPA (Web)', tech: 'React 18 + TypeScript + Tailwind v4' },
        { name: 'React Native (Mobile)', tech: 'iOS & Android' },
        { name: 'State Management', tech: 'React Context + Hooks' },
        { name: 'Real-time', tech: 'WebSocket Client' }
      ]
    },
    {
      id: 'gateway',
      title: 'API Gateway',
      color: 'from-purple-500 to-purple-600',
      icon: <Server className="w-6 h-6" />,
      components: [
        { name: 'Load Balancer', tech: 'Kong / Nginx' },
        { name: 'Rate Limiting', tech: '1000 req/h par user' },
        { name: 'Authentication', tech: 'JWT Bearer Token' },
        { name: 'SSL/TLS', tech: 'Let\'s Encrypt' }
      ]
    },
    {
      id: 'microservices',
      title: 'Microservices',
      color: 'from-rose-500 to-rose-600',
      icon: <Layers className="w-6 h-6" />,
      components: [
        { name: 'User Service', tech: 'FastAPI (Port 8001)' },
        { name: 'Medical Records', tech: 'FastAPI (Port 8002)' },
        { name: 'AI Agent Service', tech: 'FastAPI + LangGraph (Port 8003)' },
        { name: 'OCR & NLP', tech: 'Python + Tesseract (Port 8004)' },
        { name: 'Payment', tech: 'Konnect Integration (Port 8005)' },
        { name: 'Notification', tech: 'WebSocket + Email/SMS (Port 8006)' }
      ]
    },
    {
      id: 'ai',
      title: 'AI & ML Layer',
      color: 'from-orange-500 to-orange-600',
      icon: <Brain className="w-6 h-6" />,
      components: [
        { name: 'OCR Engine', tech: 'Tesseract + Azure Vision' },
        { name: 'NLP Medical', tech: 'spaCy + scispaCy' },
        { name: 'LLM Analysis', tech: 'OpenAI GPT-4 Turbo' },
        { name: 'Agent Framework', tech: 'LangGraph + LangChain' },
        { name: 'Vector Memory', tech: 'Pinecone / Weaviate' }
      ]
    },
    {
      id: 'data',
      title: 'Couche Données',
      color: 'from-green-500 to-green-600',
      icon: <Database className="w-6 h-6" />,
      components: [
        { name: 'PostgreSQL', tech: 'Données structurées + PITR' },
        { name: 'MongoDB', tech: 'Documents JSON' },
        { name: 'Redis', tech: 'Cache + Message Queue' },
        { name: 'S3 Storage', tech: 'Documents médicaux (MinIO/AWS)' },
        { name: 'Vector DB', tech: 'Mémoire long-terme agent' }
      ]
    },
    {
      id: 'security',
      title: 'Sécurité & Conformité',
      color: 'from-red-500 to-red-600',
      icon: <Shield className="w-6 h-6" />,
      components: [
        { name: 'Encryption at Rest', tech: 'AES-256' },
        { name: 'Encryption in Transit', tech: 'TLS 1.3' },
        { name: 'Access Control', tech: 'RBAC + JWT' },
        { name: 'Audit Logs', tech: 'ELK Stack' },
        { name: 'Compliance', tech: 'HIPAA / GDPR Ready' }
      ]
    },
    {
      id: 'monitoring',
      title: 'Monitoring & Observability',
      color: 'from-indigo-500 to-indigo-600',
      icon: <Activity className="w-6 h-6" />,
      components: [
        { name: 'Metrics', tech: 'Prometheus + Grafana' },
        { name: 'Distributed Tracing', tech: 'Jaeger' },
        { name: 'Logging', tech: 'ELK (Elasticsearch, Logstash, Kibana)' },
        { name: 'Alerting', tech: 'Slack / PagerDuty' }
      ]
    }
  ];

  const dataFlows = [
    {
      title: 'Upload Document → AI Analysis',
      steps: [
        'Patient upload PDF via Frontend',
        'API Gateway → Medical Records Service',
        'Store in S3 + MongoDB metadata',
        'Trigger AI Agent Service (async)',
        'OCR Service extracts text',
        'NLP Service extracts entities',
        'LLM analyzes + generates report',
        'Store results + notify patient (WebSocket)'
      ],
      color: 'blue'
    },
    {
      title: 'Autonomous Follow-up Analysis',
      steps: [
        'Celery scheduler triggers task',
        'AI Agent loads patient context',
        'Analyzes recent documents',
        'Detects data gaps',
        'Generates updated report',
        'Schedules next analysis',
        'Sends notification to patient'
      ],
      color: 'purple'
    },
    {
      title: 'Doctor Views Patient Record',
      steps: [
        'Doctor authenticates (JWT)',
        'Request patient record (RBAC check)',
        'Medical Records Service fetches data',
        'Aggregate from PostgreSQL + MongoDB',
        'AI insights from cache (Redis)',
        'Return comprehensive view',
        'Log access (audit trail)'
      ],
      color: 'green'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-rose-500 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Server className="w-12 h-12" />
          <div>
            <h1 className="text-3xl font-bold">Architecture Système Laura</h1>
            <p className="text-blue-100 mt-2">
              Plateforme HealthTech Full-Stack avec IA Autonome
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <StatCard icon={<Layers />} label="Microservices" value="6" />
          <StatCard icon={<Brain />} label="AI Models" value="4" />
          <StatCard icon={<Database />} label="Data Stores" value="5" />
          <StatCard icon={<Shield />} label="Security Layers" value="3" />
        </div>
      </div>

      {/* Architecture Layers */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Couches d'Architecture</h2>
        <div className="grid gap-4">
          {layers.map((layer) => (
            <LayerCard
              key={layer.id}
              layer={layer}
              isSelected={selectedLayer === layer.id}
              onClick={() => setSelectedLayer(selectedLayer === layer.id ? null : layer.id)}
            />
          ))}
        </div>
      </div>

      {/* Data Flows */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Flux de Données Principaux</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {dataFlows.map((flow, index) => (
            <DataFlowCard key={index} flow={flow} />
          ))}
        </div>
      </div>

      {/* Tech Stack Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Stack Technique Complet</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <TechStackSection
            title="Frontend"
            icon={<Code className="w-5 h-5" />}
            color="blue"
            items={[
              'React 18 + TypeScript',
              'Tailwind CSS v4',
              'React Context + Hooks',
              'WebSocket Client',
              'React Native (Mobile)'
            ]}
          />
          
          <TechStackSection
            title="Backend"
            icon={<Server className="w-5 h-5" />}
            color="purple"
            items={[
              'Python FastAPI (Async)',
              'PostgreSQL 15',
              'MongoDB',
              'Redis',
              'Celery (Task Queue)'
            ]}
          />
          
          <TechStackSection
            title="AI & ML"
            icon={<Brain className="w-5 h-5" />}
            color="orange"
            items={[
              'OpenAI GPT-4 Turbo',
              'LangGraph + LangChain',
              'Tesseract OCR',
              'spaCy + scispaCy',
              'Pinecone Vector DB'
            ]}
          />
        </div>
      </div>

      {/* Scalability & Performance */}
      <div className="grid md:grid-cols-2 gap-6">
        <InfoCard
          title="Scalabilité"
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
          items={[
            'Microservices stateless (Kubernetes)',
            'Horizontal scaling automatique',
            'Database read replicas',
            'CDN pour assets statiques',
            'Load balancing intelligent'
          ]}
        />
        
        <InfoCard
          title="Performance"
          icon={<Zap className="w-6 h-6" />}
          color="yellow"
          items={[
            'Redis caching (TTL optimisé)',
            'Async processing (Celery)',
            'Connection pooling',
            'Query optimization',
            'API response time < 200ms'
          ]}
        />
      </div>

      {/* Deployment */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
        <h2 className="text-2xl font-bold text-indigo-900 mb-4 flex items-center gap-3">
          <Cloud className="w-7 h-7" />
          Infrastructure & Déploiement
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div>
            <h3 className="font-semibold text-indigo-900 mb-3">Cloud Infrastructure</h3>
            <ul className="space-y-2 text-sm text-indigo-800">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600">•</span>
                <span><strong>Orchestration:</strong> Kubernetes (EKS/AKS)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600">•</span>
                <span><strong>Container:</strong> Docker + Docker Compose</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600">•</span>
                <span><strong>CI/CD:</strong> GitHub Actions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600">•</span>
                <span><strong>Secrets:</strong> HashiCorp Vault</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-indigo-900 mb-3">Disaster Recovery</h3>
            <ul className="space-y-2 text-sm text-indigo-800">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600">•</span>
                <span><strong>RTO:</strong> &lt; 15 minutes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600">•</span>
                <span><strong>RPO:</strong> &lt; 5 minutes data loss</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600">•</span>
                <span><strong>Backup:</strong> Daily automated snapshots</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600">•</span>
                <span><strong>Replication:</strong> Cross-region (S3)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-lg p-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-sm opacity-90">{label}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function LayerCard({ layer, isSelected, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border-2 p-6 cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${layer.color} rounded-lg flex items-center justify-center text-white`}>
            {layer.icon}
          </div>
          <h3 className="text-xl font-bold text-gray-900">{layer.title}</h3>
        </div>
        <span className="text-sm text-gray-500">{layer.components.length} composants</span>
      </div>
      
      {isSelected && (
        <div className="space-y-2 mt-4 pt-4 border-t border-gray-200">
          {layer.components.map((comp: any, index: number) => (
            <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">{comp.name}</span>
              <span className="text-sm text-gray-600">{comp.tech}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DataFlowCard({ flow }: any) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className={`bg-gradient-to-r ${colorClasses[flow.color as keyof typeof colorClasses]} p-4 text-white`}>
        <h3 className="font-bold">{flow.title}</h3>
      </div>
      <div className="p-4">
        <ol className="space-y-2">
          {flow.steps.map((step: string, index: number) => (
            <li key={index} className="flex items-start gap-3 text-sm">
              <span className={`flex-shrink-0 w-6 h-6 rounded-full bg-${flow.color}-100 text-${flow.color}-600 flex items-center justify-center font-bold text-xs`}>
                {index + 1}
              </span>
              <span className="text-gray-700 flex-1">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function TechStackSection({ title, icon, color, items }: any) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100'
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className={`${colorClasses[color as keyof typeof colorClasses]} p-2 rounded-lg`}>
          {icon}
        </div>
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item: string, index: number) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-gray-400">→</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoCard({ title, icon, color, items }: any) {
  const colorClasses = {
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className={`bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} p-4 text-white flex items-center gap-3`}>
        {icon}
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      <div className="p-6">
        <ul className="space-y-3">
          {items.map((item: string, index: number) => (
            <li key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-gray-400 mt-2"></span>
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
