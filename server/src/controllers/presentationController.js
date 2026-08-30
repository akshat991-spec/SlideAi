import Presentation from '../models/Presentation.js';
import { generateSlides, enhanceSlide } from '../services/aiService.js';

// ── List presentations ─────────────────────────────────────────────

/**
 * GET /api/presentations
 * Returns paginated presentations for the authenticated user.
 */
export async function list(req, res, next) {
  try {
    const {
      page = 1,
      limit = 20,
      sort = '-updatedAt',
      search,
      favorite,
    } = req.query;

    const filter = { owner: req.user._id, isDeleted: false };

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (favorite === 'true') {
      filter.isFavorite = true;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [presentations, total] = await Promise.all([
      Presentation.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Presentation.countDocuments(filter),
    ]);

    res.json({
      presentations,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── Get single presentation ────────────────────────────────────────

/**
 * GET /api/presentations/:id
 */
export async function get(req, res, next) {
  try {
    const presentation = await Presentation.findOne({
      _id: req.params.id,
      owner: req.user._id,
      isDeleted: false,
    }).lean();

    if (!presentation) {
      return res.status(404).json({ message: 'Presentation not found' });
    }

    res.json({ presentation });
  } catch (err) {
    next(err);
  }
}

// ── Create presentation (with AI slide generation) ─────────────────

/**
 * POST /api/presentations
 * Creates a presentation and uses the AI service to generate slides.
 */
export async function create(req, res, next) {
  try {
    const {
      title,
      prompt = '',
      slideCount = 0,
      tone = 'Professional',
      language = 'English (US)',
      presentationType = 'Pitch Deck',
      audience = 'General',
      purpose = 'Inform',
      visualStyle = 'Minimal',
      colorTheme = 'indigo',
      referenceUrl,
      fileIds = [],
    } = req.body;

    // Generate slides via AI service
    const generatedSlides = await generateSlides({
      prompt,
      slideCount: Number(slideCount),
      tone,
      presentationType,
      audience,
    });

    const presentation = await Presentation.create({
      title: title || `${presentationType} — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      owner: req.user._id,
      slides: generatedSlides,
      prompt,
      tone,
      language,
      presentationType,
      audience,
      purpose,
      visualStyle,
      theme: { colorTheme },
    });

    res.status(201).json({ presentation });
  } catch (err) {
    next(err);
  }
}

// ── Update presentation ────────────────────────────────────────────

/**
 * PATCH /api/presentations/:id
 */
export async function update(req, res, next) {
  try {
    const allowed = ['title', 'theme', 'slides', 'tone', 'visualStyle'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const presentation = await Presentation.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id, isDeleted: false },
      updates,
      { new: true, runValidators: true }
    ).lean();

    if (!presentation) {
      return res.status(404).json({ message: 'Presentation not found' });
    }

    res.json({ presentation });
  } catch (err) {
    next(err);
  }
}

// ── Delete presentation ────────────────────────────────────────────

/**
 * DELETE /api/presentations/:id
 * Soft deletes by setting isDeleted = true.
 */
export async function remove(req, res, next) {
  try {
    const result = await Presentation.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { isDeleted: true },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: 'Presentation not found' });
    }

    res.json({ message: 'Presentation deleted' });
  } catch (err) {
    next(err);
  }
}

// ── Slide operations ───────────────────────────────────────────────

/**
 * POST /api/presentations/:id/slides
 */
export async function addSlide(req, res, next) {
  try {
    const pres = await Presentation.findOne({
      _id: req.params.id,
      owner: req.user._id,
      isDeleted: false,
    });

    if (!pres) return res.status(404).json({ message: 'Presentation not found' });

    const newSlide = {
      title: req.body.title || 'New Slide',
      subtitle: req.body.subtitle || '',
      content: req.body.content || '',
      bullets: req.body.bullets || [],
      layout: req.body.layout || 'content',
      notes: req.body.notes || '',
      order: pres.slides.length,
    };

    pres.slides.push(newSlide);
    await pres.save();

    const slide = pres.slides[pres.slides.length - 1];
    res.status(201).json({ slide });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/presentations/:id/slides/:slideId
 */
export async function updateSlide(req, res, next) {
  try {
    const pres = await Presentation.findOne({
      _id: req.params.id,
      owner: req.user._id,
      isDeleted: false,
    });

    if (!pres) return res.status(404).json({ message: 'Presentation not found' });

    const slide = pres.slides.id(req.params.slideId);
    if (!slide) return res.status(404).json({ message: 'Slide not found' });

    const allowed = ['title', 'subtitle', 'content', 'bullets', 'layout', 'notes', 'imagePrompt'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) slide[key] = req.body[key];
    }

    await pres.save();
    res.json({ slide });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/presentations/:id/slides/:slideId
 */
export async function deleteSlide(req, res, next) {
  try {
    const pres = await Presentation.findOne({
      _id: req.params.id,
      owner: req.user._id,
      isDeleted: false,
    });

    if (!pres) return res.status(404).json({ message: 'Presentation not found' });

    const slide = pres.slides.id(req.params.slideId);
    if (!slide) return res.status(404).json({ message: 'Slide not found' });

    slide.deleteOne();
    await pres.save();

    res.json({ message: 'Slide deleted' });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/presentations/:id/slides/reorder
 * Body: { slideIds: string[] } — ordered array of slide _ids
 */
export async function reorderSlides(req, res, next) {
  try {
    const { slideIds } = req.body;
    if (!Array.isArray(slideIds)) {
      return res.status(400).json({ message: 'slideIds must be an array' });
    }

    const pres = await Presentation.findOne({
      _id: req.params.id,
      owner: req.user._id,
      isDeleted: false,
    });

    if (!pres) return res.status(404).json({ message: 'Presentation not found' });

    // Rebuild slides array in the requested order
    const slideMap = new Map(pres.slides.map((s) => [s._id.toString(), s]));
    pres.slides = slideIds
      .filter((id) => slideMap.has(id))
      .map((id, idx) => {
        const s = slideMap.get(id);
        s.order = idx;
        return s;
      });

    await pres.save();
    res.json({ slides: pres.slides });
  } catch (err) {
    next(err);
  }
}

// ── Favorites ──────────────────────────────────────────────────────

/**
 * PATCH /api/presentations/:id/favorite
 */
export async function toggleFavorite(req, res, next) {
  try {
    const pres = await Presentation.findOne({
      _id: req.params.id,
      owner: req.user._id,
      isDeleted: false,
    });

    if (!pres) return res.status(404).json({ message: 'Presentation not found' });

    pres.isFavorite = !pres.isFavorite;
    await pres.save();

    res.json({ isFavorite: pres.isFavorite });
  } catch (err) {
    next(err);
  }
}

// ── Sharing ────────────────────────────────────────────────────────

/**
 * POST /api/presentations/:id/share
 */
export async function enableShare(req, res, next) {
  try {
    const pres = await Presentation.findOne({
      _id: req.params.id,
      owner: req.user._id,
      isDeleted: false,
    });

    if (!pres) return res.status(404).json({ message: 'Presentation not found' });

    if (!pres.shareId) {
      pres.generateShareId();
      await pres.save();
    }

    res.json({ shareId: pres.shareId, shareUrl: `${process.env.CLIENT_URL}/share/${pres.shareId}` });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/presentations/:id/share
 */
export async function disableShare(req, res, next) {
  try {
    await Presentation.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { shareId: null, isShared: false }
    );
    res.json({ message: 'Sharing disabled' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/share/:shareId  (public)
 */
export async function getShared(req, res, next) {
  try {
    const pres = await Presentation.findOne({
      shareId: req.params.shareId,
      isShared: true,
      isDeleted: false,
    }).lean();

    if (!pres) return res.status(404).json({ message: 'Shared presentation not found' });

    res.json({ presentation: pres });
  } catch (err) {
    next(err);
  }
}

// ── AI Enhance ─────────────────────────────────────────────────────

/**
 * POST /api/presentations/:id/ai/enhance-slide
 * Body: { slideId, instruction }
 */
export async function aiEnhanceSlide(req, res, next) {
  try {
    const { slideId, instruction } = req.body;

    const pres = await Presentation.findOne({
      _id: req.params.id,
      owner: req.user._id,
      isDeleted: false,
    });

    if (!pres) return res.status(404).json({ message: 'Presentation not found' });

    const slide = pres.slides.id(slideId);
    if (!slide) return res.status(404).json({ message: 'Slide not found' });

    const enhanced = await enhanceSlide(slide.toObject(), instruction);

    // Apply enhancements
    Object.assign(slide, enhanced);
    await pres.save();

    res.json({ slide });
  } catch (err) {
    next(err);
  }
}

// ── Export stubs ───────────────────────────────────────────────────
// Real PDF/PPTX export would use puppeteer/pptxgenjs.
// For now, return a placeholder response.

export async function exportPdf(req, res, next) {
  try {
    const pres = await Presentation.findOne({
      _id: req.params.id,
      owner: req.user._id,
      isDeleted: false,
    }).lean();

    if (!pres) return res.status(404).json({ message: 'Presentation not found' });

    // Return minimal valid PDF bytes as placeholder
    const placeholder = Buffer.from(
      `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF`
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pres.title}.pdf"`);
    res.send(placeholder);
  } catch (err) {
    next(err);
  }
}

export async function exportPptx(req, res, next) {
  try {
    const pres = await Presentation.findOne({
      _id: req.params.id,
      owner: req.user._id,
      isDeleted: false,
    }).lean();

    if (!pres) return res.status(404).json({ message: 'Presentation not found' });

    res.status(501).json({ message: 'PPTX export coming soon. PDF export is available.' });
  } catch (err) {
    next(err);
  }
}
