interface ToggleButtonProps {
    isAttack: boolean;
    setIsAttack: React.Dispatch<React.SetStateAction<boolean>>;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({isAttack, setIsAttack}) => {
    return (
        <div className="flex items-center space-x-3">
          {/* Left Label */}
          <span className="text-sm font-medium text-white-700">Attack</span>
    
          {/* Toggle Button */}
          <button
            onClick={() => setIsAttack(!isAttack)}
            className={`relative w-14 h-8 rounded-full transition duration-150 ${
              isAttack ? "bg-green-500" : "bg-blue-500"
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-150 ${
                isAttack ? "translate-x-0" : "translate-x-6"
              }`}
            />
          </button>
    
          {/* Right Label */}
          <span className="text-sm font-medium text-white-700">Defense</span>
        </div>
      );
};

export default ToggleButton;
