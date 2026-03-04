export function Footer() {
  return (
    <footer className="px-6 lg:px-16 py-8 border-t border-white/10 bg-white/10 backdrop-blur-md">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-navy/50">
        <p>&copy; {new Date().getFullYear()} J. Abduroziq. All rights reserved.</p>
        <p>Think Beyond Limits.</p>
      </div>
    </footer>
  );
}
