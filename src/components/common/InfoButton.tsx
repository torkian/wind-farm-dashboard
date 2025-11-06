import { useState } from 'react';
import { Info, X } from 'lucide-react';

interface InfoButtonProps {
  title: string;
  description: string;
  formula?: string;
  interpretation?: string;
  example?: string;
}

export function InfoButton({ title, description, formula, interpretation, example }: InfoButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-blue-100 rounded-full transition-all hover:scale-110 border-2 border-blue-200 bg-blue-50"
        title="Click for detailed explanation"
        aria-label="Information about this visualization"
      >
        <Info size={20} className="text-blue-600" strokeWidth={2.5} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Info size={24} className="text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {/* Description */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">What This Shows:</h4>
                  <p className="text-sm text-gray-600">{description}</p>
                </div>

                {/* Formula */}
                {formula && (
                  <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Calculation:</h4>
                    <code className="text-sm text-blue-800 font-mono block whitespace-pre-wrap">
                      {formula}
                    </code>
                  </div>
                )}

                {/* Interpretation */}
                {interpretation && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">How to Interpret:</h4>
                    <p className="text-sm text-gray-600">{interpretation}</p>
                  </div>
                )}

                {/* Example */}
                {example && (
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Example:</h4>
                    <p className="text-sm text-gray-600">{example}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
