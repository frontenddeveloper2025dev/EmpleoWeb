import { Briefcase, Linkedin, Twitter, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Briefcase className="text-primary text-2xl mr-2" />
              <span className="text-xl font-bold">JobPortal</span>
            </div>
            <p className="text-secondary-foreground/80 text-sm">
              La plataforma líder para encontrar tu próximo empleo en España.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Para candidatos</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
              <li><a href="#" className="hover:text-secondary-foreground transition-colors" data-testid="footer-search-jobs">Buscar empleos</a></li>
              <li><a href="#" className="hover:text-secondary-foreground transition-colors" data-testid="footer-create-profile">Crear perfil</a></li>
              <li><a href="#" className="hover:text-secondary-foreground transition-colors" data-testid="footer-upload-resume">Subir currículum</a></li>
              <li><a href="#" className="hover:text-secondary-foreground transition-colors" data-testid="footer-career-tips">Consejos de carrera</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Para empresas</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
              <li><a href="#" className="hover:text-secondary-foreground transition-colors" data-testid="footer-post-jobs">Publicar empleos</a></li>
              <li><a href="#" className="hover:text-secondary-foreground transition-colors" data-testid="footer-search-candidates">Buscar candidatos</a></li>
              <li><a href="#" className="hover:text-secondary-foreground transition-colors" data-testid="footer-company-plans">Planes de empresa</a></li>
              <li><a href="#" className="hover:text-secondary-foreground transition-colors" data-testid="footer-hr-resources">Recursos de RRHH</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Soporte</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
              <li><a href="#" className="hover:text-secondary-foreground transition-colors" data-testid="footer-help-center">Centro de ayuda</a></li>
              <li><a href="#" className="hover:text-secondary-foreground transition-colors" data-testid="footer-contact">Contacto</a></li>
              <li><a href="#" className="hover:text-secondary-foreground transition-colors" data-testid="footer-terms">Términos de uso</a></li>
              <li><a href="#" className="hover:text-secondary-foreground transition-colors" data-testid="footer-privacy">Privacidad</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-secondary-foreground/60">
            © 2024 JobPortal. Todos los derechos reservados.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors" data-testid="social-linkedin">
              <Linkedin />
            </a>
            <a href="#" className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors" data-testid="social-twitter">
              <Twitter />
            </a>
            <a href="#" className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors" data-testid="social-facebook">
              <Facebook />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
