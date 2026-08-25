export type OrderStatus = "placed" | "packed" | "out_for_delivery" | "delivered";

const steps = [
  { key: "placed", label: "Order Placed" },
  { key: "packed", label: "Packed" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

export default function OrderPipeline({ currentStatus }: { currentStatus: OrderStatus }) {
  const currentIndex = steps.findIndex(s => s.key === currentStatus);

  return (
    <div className="flex items-center justify-between w-full mt-6 relative">
      {/* Background Line */}
      <div className="absolute top-4 left-0 w-full h-1 bg-line -z-10 rounded-full"></div>
      
      {/* Active Line */}
      <div 
        className="absolute top-4 left-0 h-1 bg-green transition-all duration-500 ease-in-out -z-10 rounded-full"
        style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
      ></div>

      {steps.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isActive = index === currentIndex;

        return (
          <div key={step.key} className="flex flex-col items-center gap-2">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${
                isCompleted 
                  ? 'bg-green border-green text-white shadow-sm' 
                  : 'bg-white border-line text-ink-3'
              } ${isActive ? 'ring-4 ring-green-soft' : ''}`}
            >
              {isCompleted ? '✓' : index + 1}
            </div>
            <span className={`text-xs font-semibold ${isCompleted ? 'text-green-deep' : 'text-ink-3'}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
