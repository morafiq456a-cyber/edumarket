const LoadingSpinner = ({ text = 'جاري التحميل...' }) => {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  );
};

export default LoadingSpinner;