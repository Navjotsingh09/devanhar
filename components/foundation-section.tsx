import { Button } from "@/components/ui/button"

export function FoundationSection() {
  return (
    <section id="foundation" className="py-16 md:py-20 border-t border-border">
      <div className="container mx-auto px-6 lg:px-12">
        <div data-animate className="text-center">
          <p className="text-sm text-muted-foreground">
            Registered Charity in England & Wales
          </p>
          <p className="text-2xl md:text-3xl font-bold text-foreground mt-2">
            Charity Number: 1203393
          </p>
        </div>
      </div>
    </section>
  )
}
