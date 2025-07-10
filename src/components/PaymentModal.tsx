
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { usePayments } from '@/hooks/usePayments';
import { useToast } from '@/hooks/use-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    id: string;
    total: number;
    customerName: string;
  };
}

const PaymentModal = ({ isOpen, onClose, orderData }: PaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState('mtn_money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  
  const { processMTNPayment, processAirtelPayment } = usePayments();
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number to proceed.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    const paymentData = {
      orderId: orderData.id,
      amount: orderData.total,
      phoneNumber: phoneNumber,
      customerName: orderData.customerName
    };

    let result;
    if (paymentMethod === 'mtn_money') {
      result = await processMTNPayment(paymentData);
    } else {
      result = await processAirtelPayment(paymentData);
    }

    if (result.success) {
      setPaymentDetails(result.data);
    }

    setIsProcessing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-lg font-semibold">Total Amount: ₹{orderData.total}</p>
          </div>

          {!paymentDetails ? (
            <>
              <div className="space-y-4">
                <Label>Select Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mtn_money" id="mtn" />
                    <Label htmlFor="mtn">MTN Mobile Money</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="airtel_money" id="airtel" />
                    <Label htmlFor="airtel">Airtel Money</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <Button 
                onClick={handlePayment} 
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Processing...' : 'Pay Now'}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-green-600 mb-2">
                  Payment Request Created!
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {paymentDetails.instructions}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div>
                  <Label className="text-sm font-medium">USSD Code:</Label>
                  <div className="font-mono text-lg bg-white p-2 rounded border">
                    {paymentDetails.ussdCode}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Payment Reference:</Label>
                  <div className="font-mono text-sm bg-white p-2 rounded border">
                    {paymentDetails.paymentReference}
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-gray-500">
                This payment request expires in 15 minutes
              </div>

              <Button onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
