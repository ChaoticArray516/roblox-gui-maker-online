/**
 * SOP-3B-20: SEO 组件 barrel export
 *
 * 统一入口：import { HomeJsonLd, JsonLd, Breadcrumb } from "@/components/seo";
 */

export { JsonLd, type JsonLdProps } from "./JsonLd";
export { buildOpenGraph, type OpenGraphProps } from "./OpenGraph";
export { buildAlternates, type CanonicalProps } from "./Canonical";
export {
  Breadcrumb,
  type BreadcrumbProps,
  type BreadcrumbItem,
} from "./Breadcrumb";

export { HomeJsonLd } from "./HomeJsonLd";
export { EditorJsonLd } from "./EditorJsonLd";
export { TemplatesListJsonLd } from "./TemplatesListJsonLd";
export {
  TemplateDetailJsonLd,
  type TemplateDetailProps,
} from "./TemplateDetailJsonLd";
export { PricingJsonLd } from "./PricingJsonLd";
export { PluginJsonLd } from "./PluginJsonLd";
export { FaqJsonLd } from "./FaqJsonLd";
export { FigmaToRobloxJsonLd } from "./FigmaToRobloxJsonLd";
export {
  UseCasesListJsonLd,
  type UseCasesListJsonLdProps,
  type UseCaseItem,
} from "./UseCasesListJsonLd";
export {
  UseCaseDetailJsonLd,
  type UseCaseDetailJsonLdProps,
  type UseCaseStep,
} from "./UseCaseDetailJsonLd";
export { GuidesListJsonLd } from "./GuidesListJsonLd";
export {
  GuideDetailJsonLd,
  type GuideDetailJsonLdProps,
  type GuideStep,
} from "./GuideDetailJsonLd";
export {
  BlogListJsonLd,
  type BlogListJsonLdProps,
  type BlogPostSummary,
} from "./BlogListJsonLd";
export {
  BlogPostJsonLd,
  type BlogPostJsonLdProps,
} from "./BlogPostJsonLd";
export { DocsJsonLd, type DocsJsonLdProps } from "./DocsJsonLd";
