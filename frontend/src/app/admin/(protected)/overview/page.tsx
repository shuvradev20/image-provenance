import { Suspense } from "react";
import { OverviewContainer } from "@/components/sections/admin/overview/OverviewContainer";
import { OverviewSkeleton } from "@/components/sections/admin/overview/OverviewSkeleton";

export default function AdminOverviewPage() {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <OverviewContainer />
    </Suspense>
  );
}