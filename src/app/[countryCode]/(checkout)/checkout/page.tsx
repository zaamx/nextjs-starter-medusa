import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import LoginTemplate from "@modules/account/templates/login-template"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Compra",
}

export default async function Checkout({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params;
  const cart = await retrieveCart();

  if (!cart) return notFound();

  const customer = await retrieveCustomer();

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
        <h2 className="text-2xl font-semibold mb-4">Inicia sesión para continuar con la compra</h2>
        <div className="w-full max-w-md">
          <LoginTemplate 
            redirectTo={`/${countryCode}/checkout`} 
            cart={cart}
            countryCode={countryCode}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-x-40 py-12">
      <PaymentWrapper cart={cart}>
        <CheckoutForm cart={cart} customer={customer} />
      </PaymentWrapper>
      <CheckoutSummary cart={cart} />
    </div>
  );
}
