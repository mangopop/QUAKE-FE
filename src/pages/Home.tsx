// Home.tsx
import TestCard from "../components/TestCard";

const testEntries = [
  {
    id: 1,
    title: "Login Test",
    template: "Auth",
    sections: [
      { name: "Enter Credentials 1", passed: true, notes: "Worked fine" },
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

export default function Home() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Test Entries</h2>
      <div>
        {testEntries.map((test) => (
          <TestCard key={test.id} test={test} />
        ))}
      </div>
    </div>
  );
}
