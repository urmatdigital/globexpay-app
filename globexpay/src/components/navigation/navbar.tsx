import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="flex items-center space-x-2">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-foreground">
            <path d="M16 2L2 9L16 16L30 9L16 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 23L16 30L30 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 16L16 23L30 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-bold">GlobExPay</span>
        </Link>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-6">
            <Link href="#features" className="text-sm font-medium transition-colors hover:text-foreground/80">
              Возможности
            </Link>
            <Link href="#about" className="text-sm font-medium transition-colors hover:text-foreground/80">
              О нас
            </Link>
            <Link href="#contact" className="text-sm font-medium transition-colors hover:text-foreground/80">
              Контакты
            </Link>
          </nav>
          
          <div className="flex items-center space-x-2">
            <Link 
              href="/auth/login"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4"
            >
              Войти
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
