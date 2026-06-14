"use client";

type DeleteHorseButtonProps = {
  horseId: string;
};

export default function DeleteHorseButton({ horseId }: DeleteHorseButtonProps) {
  return (
    <form action={`/horses/${horseId}/delete`} method="POST">
      <button
        type="submit"
        className="rounded-full bg-red-700 px-5 py-3 text-sm font-semibold text-white hover:bg-red-800"
        onClick={(event) => {
          if (!confirm("Are you sure you want to delete this horse?")) {
            event.preventDefault();
          }
        }}
      >
        Delete Horse
      </button>
    </form>
  );
}