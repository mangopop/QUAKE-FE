import type { Owner } from "../services/types";

interface OwnerInfoProps {
  owner: Owner;
  className?: string;
}

export default function OwnerInfo({ owner, className = "text-sm text-gray-500" }: OwnerInfoProps) {
  return (
    <p className={className}>
      Owner: {owner.firstName} {owner.lastName}
    </p>
  );
}