import { NumberValueCard } from '@/components/core/NumberValueCard';

export const Example = () => {
  return (
    <div className="flex gap-4">
      <NumberValueCard 
        number={14}
        value={120000}
      />
      
      {/* Custom colors */}
      <NumberValueCard 
        number="23"
        value="N250,000"
        primaryColor="#FF00FF"
        secondaryColor="#7B3C99"
      />
      
      {/* Custom size */}
      <NumberValueCard 
        number={7}
        value={85000}
        width={150}
        height={150}
      />
    </div>
  );
};