import { useState } from "react";

export default function Configuracion() {
  const [nombreColegio, setNombreColegio] = useState("Colegio Proyección");
  const [logo, setLogo] = useState<string | null>(null);

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-10 ml-64">
      <h1 className="text-3xl font-bold mb-8">⚙️ Configuración</h1>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center gap-6">
          {logo ? (
            <img src={logo} alt="Logo del colegio" className="w-24 h-24 rounded-full object-cover border" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">Sin logo</div>
          )}
          <div>
            <label className="block font-semibold mb-2">Nombre del colegio</label>
            <input
              type="text"
              value={nombreColegio}
              onChange={(e) => setNombreColegio(e.target.value)}
              className="border p-2 rounded w-full mb-4"
            />

            <label className="block font-semibold mb-2">Logo del colegio</label>
            <input type="file" accept="image/*" onChange={handleLogo} className="border p-2 rounded w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
