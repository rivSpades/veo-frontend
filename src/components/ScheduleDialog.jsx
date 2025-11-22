import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog';
import { Button } from './ui/Button';
import { Label } from './ui/Label';
import { Input } from './ui/Input';
import { Switch } from './ui/Switch';
import { Checkbox } from './ui/Checkbox';

const dayOptions = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

export function ScheduleDialog({ menu, isOpen, onClose, onSave }) {
  // Initialize schedule from menu or default
  const getInitialSchedule = () => {
    if (menu?.schedule && typeof menu.schedule === 'object' && Object.keys(menu.schedule).length > 0) {
      return {
        enabled: menu.schedule.enabled || false,
        startTime: menu.schedule.startTime || '09:00',
        endTime: menu.schedule.endTime || '17:00',
        days: Array.isArray(menu.schedule.days) ? menu.schedule.days : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      };
    }
    return {
      enabled: false,
      startTime: '09:00',
      endTime: '17:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    };
  };

  const [schedule, setSchedule] = useState(getInitialSchedule());

  // Update schedule when menu changes
  useEffect(() => {
    if (isOpen && menu) {
      setSchedule(getInitialSchedule());
    }
  }, [isOpen, menu]);

  const handleSave = () => {
    onSave(schedule);
    onClose();
  };

  const toggleDay = (day) => {
    setSchedule((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day],
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Schedule Menu: {menu.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              checked={schedule.enabled}
              onCheckedChange={(enabled) => setSchedule((prev) => ({ ...prev, enabled }))}
            />
            <Label>Enable automatic scheduling</Label>
          </div>

          {schedule.enabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={schedule.startTime}
                    onChange={(e) => setSchedule((prev) => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={schedule.endTime}
                    onChange={(e) => setSchedule((prev) => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Active Days</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {dayOptions.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        checked={schedule.days.includes(day.value)}
                        onCheckedChange={() => toggleDay(day.value)}
                      />
                      <Label className="text-sm">{day.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Schedule</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
