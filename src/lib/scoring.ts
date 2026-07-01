export function fitBadgeClass(fit: string): string {
  switch (fit) {
    case "A": return "bg-[hsl(var(--fit-a))] text-[hsl(var(--fit-a-foreground))]";
    case "B": return "bg-[hsl(var(--fit-b))] text-[hsl(var(--fit-b-foreground))]";
    case "C": return "bg-[hsl(var(--fit-c))] text-[hsl(var(--fit-c-foreground))]";
    case "rejected": return "bg-[hsl(var(--fit-rejected))] text-[hsl(var(--fit-rejected-foreground))]";
    default: return "bg-[hsl(var(--fit-pending))] text-[hsl(var(--fit-pending-foreground))]";
  }
}

export const SEGMENTS = [
  "loodgieter",
  "installatiebedrijf",
  "dakdekker",
  "elektricien",
  "aannemer",
  "onderhoudsbedrijf",
  "cv installateur",
  "warmtepomp installateur",
  "groepenkast service",
];

export function slugify(str: string): string {
  return str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}
