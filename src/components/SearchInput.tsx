interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export default function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border p-2 rounded w-full"
      />
    </div>
  );
}