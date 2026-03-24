import DigitalTwin from './components/DigitalTwin';

export default function Twin() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">Digital Twin</h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          This is an AI version of me, built from my career history. Ask it anything about my
          background, experience, or what I've worked on. It won't make things up — if it doesn't
          know, it'll say so. For a richer conversation, get in touch and I'll send you a link.
        </p>
      </div>
      <DigitalTwin />
    </div>
  );
}
