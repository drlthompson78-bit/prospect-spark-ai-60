import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ShopLayout from "@/pages/shop/ShopLayout";
import HomePage from "@/pages/shop/HomePage";
import CollectionPage from "@/pages/shop/CollectionPage";
import OnzeTaartenPage from "@/pages/shop/OnzeTaartenPage";
import ProductPage from "@/pages/shop/ProductPage";
import CustomPage from "@/pages/shop/CustomPage";
import CheckoutPage from "@/pages/shop/CheckoutPage";
import ThanksPage from "@/pages/shop/ThanksPage";
import NotFound from "@/pages/NotFound";

const App = () => (
  <TooltipProvider>
    <Sonner position="bottom-center" />
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<ShopLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/collectie" element={<CollectionPage />} />
          <Route path="/onze-taarten" element={<OnzeTaartenPage />} />
          <Route path="/collectie/:slug" element={<ProductPage />} />
          <Route path="/op-maat" element={<CustomPage />} />
          <Route path="/bestellen" element={<CheckoutPage />} />
          <Route path="/bedankt" element={<ThanksPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
