import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Briefcase, Menu } from "lucide-react";
import { authService } from "@/lib/auth";
import { useState, useEffect } from "react";
import { User } from "@shared/schema";

export default function Header() {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const currentUser = authService.getUser();
    setUser(currentUser);
  }, []);

  const handleSignOut = () => {
    authService.logout();
    setUser(null);
    navigate("/");
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <div className="flex items-center cursor-pointer" data-testid="logo">
                <Briefcase className="text-primary text-2xl mr-2" />
                <span className="text-xl font-bold text-foreground">JobPortal</span>
              </div>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/">
                <a className="text-foreground hover:text-primary transition-colors font-medium" data-testid="nav-jobs">
                  Empleos
                </a>
              </Link>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="nav-companies">
                Empresas
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="nav-salaries">
                Salarios
              </a>
              {user?.userType === 'employer' && (
                <Link href="/dashboard">
                  <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="nav-dashboard">
                    Panel de Control
                  </a>
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-muted-foreground hidden sm:inline" data-testid="user-greeting">
                  Hola, {user.firstName}
                </span>
                <Link href="/dashboard">
                  <Button variant="ghost" data-testid="button-dashboard">
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  data-testid="button-signout"
                >
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" data-testid="button-signin">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button data-testid="button-signup">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              data-testid="button-mobile-menu"
            >
              <Menu />
            </Button>
          </div>
        </div>
        
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-2">
              <Link href="/">
                <a className="text-foreground hover:text-primary transition-colors font-medium py-2" data-testid="mobile-nav-jobs">
                  Empleos
                </a>
              </Link>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors py-2" data-testid="mobile-nav-companies">
                Empresas
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors py-2" data-testid="mobile-nav-salaries">
                Salarios
              </a>
              {user?.userType === 'employer' && (
                <Link href="/dashboard">
                  <a className="text-muted-foreground hover:text-primary transition-colors py-2" data-testid="mobile-nav-dashboard">
                    Panel de Control
                  </a>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
