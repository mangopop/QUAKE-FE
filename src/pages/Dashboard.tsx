// Dashboard.tsx
import TestCard from "../components/TestCard";

// Mock test entries for dashboard
const testEntries = [
  {
    id: 1,
    title: "Login Test",
    template: "Auth",
    sections: [
      { name: "Enter Credentials", passed: true, notes: "Worked fine" },
      { name: "Click Submit", passed: false, notes: "Submit button not responsive" }
    ]
  },
  {
    id: 2,
    title: "Payment Test",
    template: "Checkout",
    sections: [
      { name: "Enter Card Details", passed: false, notes: "Payment failed" },
      { name: "Verify Payment", passed: true, notes: "Payment verified" }
    ]
  }
];

export default function Dashboard() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Dashboard</h2>
      <p className="mb-4">Overview of recent test results and statuses.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {testEntries.map((test) => (
          <TestCard key={test.id} test={test} />
        ))}
      </div>
    </div>
  );
}
