import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import brandsRouter from "./brands";
import bannersRouter from "./banners";
import faqsRouter from "./faqs";
import testimonialsRouter from "./testimonials";
import settingsRouter from "./settings";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(productsRouter);
router.use(categoriesRouter);
router.use(brandsRouter);
router.use(bannersRouter);
router.use(faqsRouter);
router.use(testimonialsRouter);
router.use(settingsRouter);
router.use(dashboardRouter);

export default router;
