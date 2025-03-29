import { useState } from "react";
import TestCard from "../components/TestCard";

export default function SearchTests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTests, setFilteredTests] = useState([]);
  const allTests = [
    { id: 1, title: "Login Test", template: "Auth", sections: [{ name: "Enter Credentials", passed: true, notes: "Worked fine" }] },
    { id: 2, title: "Payment Test", template: "Checkout", sections: [{ name: "Enter Card Details", passed: false, notes: "Payment failed" }] }
  ];

  const handleSearch = () => {
    const results = allTests.filter(test =>
      test.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTests(results);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Search Tests</h2>
      <input
        type="text"
        placeholder="Search by title"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <button onClick={handleSearch} className="bg-blue-500 text-white p-2 rounded">Search</button>
      <div className="mt-4">
        {filteredTests.length > 0 ? (
          filteredTests.map(test => <TestCard key={test.id} test={test} />)
        ) : (
          <p className="text-gray-500">No results found</p>
        )}
      </div>
    </div>
  );
}