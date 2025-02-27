import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

interface Props {
  destination: string;
}

export default function ({ destination }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const lastLocation = pathname.substring(0, pathname.lastIndexOf("/"));
  return (
    <Button onClick={() => navigate(lastLocation)}>
      <ArrowLeft />
      Back to {destination}
    </Button>
  );
}
