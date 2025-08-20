import React from 'react';
import { CheckCircleIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

const TeamCodeDisplay = ({ code, onClose, onDone }) => {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {}
  };

  return (
    <div className="text-center">
      <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-3" />
      <h4 className="text-lg font-semibold text-gray-900">Team Created!</h4>
      <p className="text-gray-600 mt-1">Share this join code with your teammates:</p>
      <div className="mt-4 inline-flex items-center space-x-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
        <span className="font-mono text-2xl tracking-wider">{code}</span>
        <button onClick={copy} className="text-gray-600 hover:text-gray-900" title="Copy">
          <ClipboardDocumentIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="mt-6 flex items-center justify-center space-x-3">
        <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Close</button>
        <button onClick={onDone} className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Done</button>
      </div>
    </div>
  );
};

export default TeamCodeDisplay;


