import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import { PaymentElement, AddressElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "sonner";

interface CheckoutFormProps {
  openCheckoutModal: boolean;
  setOpenCheckoutModal: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess: (paymentId: string) => void;
  clientSecret: string;
}

function CheckoutForm({
  openCheckoutModal,
  setOpenCheckoutModal,
  onSuccess,
  clientSecret,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    try {
      const result: any = await stripe.confirmPayment({
        //`Elements` instance that was used to create the Payment Element
        elements,
        confirmParams: {
          return_url: "https://example.com/order/123/complete",
        },
        redirect: "if_required",
      });

      if (result.error) {
        toast.error(result.error.message || "Payment failed");
      } else {
        toast.success("Payment successful!");
        onSuccess(result.paymentIntent?.id || "");
      }
    } catch (error) {
      toast.error("An error occurred during payment");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={openCheckoutModal} onOpenChange={setOpenCheckoutModal}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Complete Your Booking</DialogTitle>
          <DialogDescription>
            Please proceed to payment to confirm your booking.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 overflow-hidden overflow-y-auto h-[400px]"
          >
            <PaymentElement />
            <AddressElement
              options={{
                mode: "shipping",
                allowedCountries: ["US"],
              }}
            />
            <div className="flex justify-end gap-5">
              <Button
                variant="outline"
                onClick={() => setOpenCheckoutModal(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Processing..." : "Pay Now"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CheckoutForm;
