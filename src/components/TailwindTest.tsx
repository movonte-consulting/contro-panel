import React from 'react';

const TailwindTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          ¡Hola desde Tailwind!
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Este es un componente de prueba para verificar que Tailwind CSS está funcionando correctamente.
        </p>
        <div className="space-y-4">
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200">
            Botón Primario
          </button>
          <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded transition duration-200">
            Botón Secundario
          </button>
        </div>
        <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="text-sm">
            ✅ Tailwind CSS está funcionando correctamente
          </p>
        </div>
      </div>
    </div>
  );
};

export default TailwindTest;
