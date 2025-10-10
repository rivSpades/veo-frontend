import React from 'react';
import { Dialog, DialogContent } from './ui/Dialog';
import { Button } from './ui/Button';
import { X } from 'lucide-react';
import { DemoWidget } from './DemoWidget';

export function MenuPreviewModal({ menu, restaurant, isOpen, onClose }) {
  // Use the transformed restaurant data from menu if available, otherwise use passed restaurant
  const restaurantData = menu?._restaurantData || restaurant;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-transparent border-none" showCloseButton={false}>
        <div className="relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute -top-12 right-0 z-50 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* iPhone Frame - matching landing page */}
          <div className="w-80 h-[600px] bg-black rounded-[2.5rem] p-3 shadow-2xl mx-auto">
            {/* Device notch */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black/80 rounded-full z-10" />

            {/* Screen with demo functionality */}
            <div className="bg-white rounded-[28px] overflow-hidden w-full h-full border shadow-inner scrollbar-hide">
              <DemoWidget restaurant={restaurantData} menu={menu} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
