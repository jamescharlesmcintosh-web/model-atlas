import CompareClient from "@/components/CompareClient";

export default function ComparePage({ searchParams }: { searchParams: { m?: string } }) {
  const slugs = (searchParams.m ?? "claude-sonnet-4-5-demo,gpt-4-1-demo").split(",").map((s) => s.trim()).filter(Boolean);
  return <CompareClient initialSlugs={slugs} />;
}
