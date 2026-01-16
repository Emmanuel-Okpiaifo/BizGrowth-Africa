import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import useTemplateInteractions from "./hooks/useTemplateInteractions.js";
import SiteHeader from "./components/SiteHeader.jsx";
import SiteFooter from "./components/SiteFooter.jsx";

const Contact = lazy(() => import("./pages/Contact.jsx"));
const GalleryStyle1 = lazy(() => import("./pages/GalleryStyle1.jsx"));
const GalleryStyle2 = lazy(() => import("./pages/GalleryStyle2.jsx"));
const Index = lazy(() => import("./pages/Index.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const PostStyle1 = lazy(() => import("./pages/PostStyle1.jsx"));
const PostStyle3 = lazy(() => import("./pages/PostStyle3.jsx"));
const SingleNews1 = lazy(() => import("./pages/SingleNews1.jsx"));
const SingleNews2 = lazy(() => import("./pages/SingleNews2.jsx"));
const SingleNews3 = lazy(() => import("./pages/SingleNews3.jsx"));

export default function App() {
  useTemplateInteractions();

  return (
    <>
      <SiteHeader />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/opportunities" element={<PostStyle1 />} />
          <Route path="/news-insights" element={<PostStyle3 />} />
          <Route path="/procurement-tenders" element={<GalleryStyle1 />} />
          <Route path="/tools-templates" element={<GalleryStyle2 />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/single-news-1" element={<SingleNews1 />} />
          <Route path="/single-news-2" element={<SingleNews2 />} />
          <Route path="/single-news-3" element={<SingleNews3 />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <SiteFooter />
    </>
  );
}
