/**
 * Tests for SEO component — ensure meta tags use valid attribute names
 * (no "Invalid qualified name: 'meta[property]'" across devices/locations).
 * This file is run only by the test runner and is not part of the production build.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import SEO from './SEO';

describe('SEO', () => {
	beforeEach(() => {
		// Use a clean head for each test
		document.head.querySelectorAll('meta[property], meta[name], link[rel="canonical"]').forEach((el) => el.remove());
	});

	afterEach(() => {
		document.title = '';
	});

	it('does not use invalid qualified names for meta attributes', () => {
		expect(() => {
			render(
				<SEO
					title="Test Title"
					description="Test description"
					image="/og.png"
					canonicalPath="/test"
				/>
			);
		}).not.toThrow();

		const metas = document.head.querySelectorAll('meta');
		const invalidNames = ['meta[property]', 'meta[name]'];
		metas.forEach((meta) => {
			// Valid meta tags use attribute "name" or "property" only
			const hasProperty = meta.hasAttribute('property');
			const hasName = meta.hasAttribute('name');
			expect(hasProperty || hasName).toBe(true);
			invalidNames.forEach((bad) => {
				expect(meta.getAttribute(bad)).toBeNull();
			});
		});
	});

	it('creates og meta tags with valid "property" attribute', () => {
		render(
			<SEO
				title="OG Title"
				description="OG desc"
				canonicalPath="/page"
			/>
		);

		const ogTitle = document.head.querySelector('meta[property="og:title"]');
		expect(ogTitle).not.toBeNull();
		expect(ogTitle.getAttribute('property')).toBe('og:title');
		expect(ogTitle.getAttribute('content')).toBe('OG Title');
	});

	it('creates name-based meta tags with valid "name" attribute', () => {
		render(
			<SEO
				title="T"
				description="D"
				canonicalPath="/"
			/>
		);

		const desc = document.head.querySelector('meta[name="description"]');
		expect(desc).not.toBeNull();
		expect(desc.getAttribute('name')).toBe('description');
		expect(desc.getAttribute('content')).toBe('D');
	});

	it('runs without error for article type with dates', () => {
		expect(() => {
			render(
				<SEO
					title="Article"
					description="Article desc"
					type="article"
					canonicalPath="/news/1"
					publishedTime="2025-01-01T00:00:00Z"
					modifiedTime="2025-01-02T00:00:00Z"
				/>
			);
		}).not.toThrow();

		const published = document.head.querySelector('meta[property="article:published_time"]');
		const modified = document.head.querySelector('meta[property="article:modified_time"]');
		expect(published?.getAttribute('property')).toBe('article:published_time');
		expect(modified?.getAttribute('property')).toBe('article:modified_time');
	});

	it('setAttribute is never called with invalid qualified name', () => {
		const spy = vi.spyOn(Element.prototype, 'setAttribute');
		render(
			<SEO title="S" description="D" canonicalPath="/" />
		);
		const calls = spy.mock.calls;
		calls.forEach(([name]) => {
			expect(name).not.toBe('meta[property]');
			expect(name).not.toBe('meta[name]');
		});
		spy.mockRestore();
	});
});
