import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { QA_CATALOG_FETCH_REVALIDATE_SECONDS, catalogRevalidateSeconds, isQaSite, reviewsRevalidateSeconds } from './isr';

describe('isQaSite', () => {
  it('detects the QA GitHub repo and hostnames', () => {
    assert.equal(isQaSite({ VERCEL_GIT_REPO_SLUG: 'web-formulas-matematicas-qa' }), true);
    assert.equal(isQaSite({ VERCEL_PROJECT_PRODUCTION_URL: 'web-formulas-qa.vercel.app' }), true);
    assert.equal(isQaSite({ NEXT_PUBLIC_API_URL: 'https://web-formulas-qa-api-six.vercel.app/v1' }), true);
    assert.equal(isQaSite({ NEXT_PUBLIC_SITE_PROFILE: 'qa' }), true);
  });

  it('leaves production alone', () => {
    assert.equal(isQaSite({ VERCEL_GIT_REPO_SLUG: 'web-formulas-matematicas' }), false);
    assert.equal(
      isQaSite({ VERCEL_PROJECT_PRODUCTION_URL: 'web-formulas-matematicas.vercel.app' }),
      false,
    );
  });
});

describe('catalogRevalidateSeconds', () => {
  it('is a short fetch TTL on QA and 86400 on production', () => {
    assert.equal(
      catalogRevalidateSeconds({ VERCEL_GIT_REPO_SLUG: 'web-formulas-matematicas-qa' }),
      QA_CATALOG_FETCH_REVALIDATE_SECONDS,
    );
    assert.equal(catalogRevalidateSeconds({ VERCEL_GIT_REPO_SLUG: 'web-formulas-matematicas' }), 86_400);
  });

  it('honors an explicit CATALOG_REVALIDATE_SECONDS override', () => {
    assert.equal(
      catalogRevalidateSeconds({
        VERCEL_GIT_REPO_SLUG: 'web-formulas-matematicas-qa',
        CATALOG_REVALIDATE_SECONDS: '120',
      }),
      120,
    );
  });
});

describe('reviewsRevalidateSeconds', () => {
  it('is a short fetch TTL on QA', () => {
    assert.equal(reviewsRevalidateSeconds({ NEXT_PUBLIC_SITE_PROFILE: 'qa' }), 30);
    assert.equal(reviewsRevalidateSeconds({}), 3_600);
  });
});
