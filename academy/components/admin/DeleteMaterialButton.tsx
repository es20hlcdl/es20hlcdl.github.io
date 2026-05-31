"use client";

export default function DeleteMaterialButton() {
  return (
    <button
      type="submit"
      className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
      onClick={(event) => {
        const ok = window.confirm(
          "¿Seguro que deseas eliminar este material?",
        );

        if (!ok) {
          event.preventDefault();
        }
      }}
    >
      Eliminar
    </button>
  );
}
