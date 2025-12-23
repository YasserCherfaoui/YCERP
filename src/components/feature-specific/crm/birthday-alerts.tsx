import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTodayBirthdays, getUpcomingBirthdays } from "@/services/customer-service";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Gift } from "lucide-react";
import { Link } from "react-router-dom";

export default function BirthdayAlerts() {
  const { data: todayData } = useQuery({
    queryKey: ["today-birthdays"],
    queryFn: () => getTodayBirthdays(),
  });

  const { data: upcomingData } = useQuery({
    queryKey: ["upcoming-birthdays"],
    queryFn: () => getUpcomingBirthdays(7), // Next 7 days
  });

  const todayBirthdays = todayData?.data || [];
  const upcomingBirthdays = upcomingData?.data || [];

  if (todayBirthdays.length === 0 && upcomingBirthdays.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Birthday Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {todayBirthdays.length > 0 && (
          <div>
            <div className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Today
            </div>
            <div className="space-y-2">
              {todayBirthdays.map((item: any) => (
                <Link
                  key={item.customer.phone}
                  to={`/crm/customers/${item.customer.phone}`}
                  className="block p-2 border rounded hover:bg-muted transition-colors"
                >
                  <div className="font-medium">
                    {item.customer.first_name} {item.customer.last_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Turning {item.age} today! 🎉
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {upcomingBirthdays.length > 0 && (
          <div>
            <div className="font-semibold text-lg mb-2">Upcoming (Next 7 Days)</div>
            <div className="space-y-2">
              {upcomingBirthdays.slice(0, 5).map((item: any) => (
                <Link
                  key={item.customer.phone}
                  to={`/crm/customers/${item.customer.phone}`}
                  className="block p-2 border rounded hover:bg-muted transition-colors"
                >
                  <div className="font-medium">
                    {item.customer.first_name} {item.customer.last_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.days_until} days until birthday ({item.next_birthday})
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

