export function VaultLogo({ className = "w-10 h-10" }: { className?: string }) {
  return <img 
    src="/vault-logo.svg" 
    alt="Vault Extension Logo" 
    className={`${className} transform scale-110 hover:scale-125 transition-transform duration-200`} 
  />
}
