export function Unavailable() {
  return (
    <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
      <p className="font-semibold">الخدمة مش متوفرة توّا</p>
      <p className="mt-1 text-sm">عاود جرب بعد شوية. إذا المشكل يعاود، قلنا في GitHub.</p>
    </div>
  );
}
