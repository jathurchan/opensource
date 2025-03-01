// __tests__/parseMarkdownFrontmatter.test.ts

import Ajv, { ErrorObject, ValidateFunction } from "ajv";
import { formatValidationError, getValidationErrors, parseMarkdownFrontmatter } from "../utils/parseMarkdownFrontmatter";

describe("formatValidationError", () => {
    test("Show default error message for an unknown keyword", () => {
        const fakeError: ErrorObject = {
            instancePath: '/example',
            message: 'has an error',
            keyword: 'unknownKeyword',
            params: {},
            schemaPath: '',
        };
    
        const result = formatValidationError(fakeError);
        expect(result).toMatch(/ \(Keyword: unknownKeyword\)$/);
    });
});

describe("getValidationErrors", () => {
    test("Handle validateFrontmatter.errors undefined", () => {
        const fakeValidator = {
            errors: undefined
        } as ValidateFunction;
    
        const result = getValidationErrors(fakeValidator);
        expect(result).toEqual([]);
    });
});

describe("parseMarkdownFrontmatter", () => {

    const minimalValidFrontmatter = {
        title: "Test Title",
        date: "2025-02-18",
        authors: ["jathurchan"],
    };

    const fullValidFrontmatter = {
        title: "Test Title",
        intro: "Test Introduction",
        allowTitleToDifferFromFilename: true,
        date: "2025-02-18",
        authors: ["jathurchan", "mathusanm6"],
        featuredVideo: "https://youtu.be/sOmeViDeO",
        projects: ["projectId"],
        skills: ["skillId"],
        includeLinks: ["/some/link"],
        showRelatedPRs: false,
    };

    // ==== Several simulataneous Errors ====

    test("Fail when multiple errors are present", () => {
        const data = {}; // Missing title, date, and authors
        try {
            parseMarkdownFrontmatter(data);
            throw new Error("Expected parseMarkdownFrontmatter to throw an error.");
        } catch (error: any) {
            expect(error.message).toMatch(/Missing required field 'title'/);
            expect(error.message).toMatch(/Missing required field 'date'/);
            expect(error.message).toMatch(/Missing required field 'authors'/);
        }
    });

    // ==== Valid Frontmatter ====

    test("Parse valid frontmatter with only required fields", () => {
        const result = parseMarkdownFrontmatter({ ...minimalValidFrontmatter });
        expect(result.title).toBe(minimalValidFrontmatter.title);
        expect(result.date).toEqual(new Date(minimalValidFrontmatter.date));
        expect(result.authors).toEqual(minimalValidFrontmatter.authors);
        // Optional fields should have their defaults:
        expect(result.intro).toBeUndefined();
        expect(result.allowTitleToDifferFromFilename).toBe(false);
        expect(result.featuredVideo).toBeUndefined();
        expect(result.projects).toEqual([]);
        expect(result.skills).toEqual([]);
        expect(result.includeLinks).toEqual([]);
        expect(result.showRelatedPRs).toBe(true);
    });

    test("Parse valid frontmatter with all fields", () => {
        const result = parseMarkdownFrontmatter({ ...fullValidFrontmatter });
        expect(result.title).toBe(fullValidFrontmatter.title);
        expect(result.intro).toBe(fullValidFrontmatter.intro);
        expect(result.allowTitleToDifferFromFilename).toBe(
        fullValidFrontmatter.allowTitleToDifferFromFilename
        );
        expect(result.date).toEqual(new Date(fullValidFrontmatter.date));
        expect(result.authors).toEqual(fullValidFrontmatter.authors);
        expect(result.featuredVideo?.toString()).toBe(fullValidFrontmatter.featuredVideo);
        expect(result.projects).toEqual(fullValidFrontmatter.projects);
        expect(result.skills).toEqual(fullValidFrontmatter.skills);
        expect(result.includeLinks).toEqual(fullValidFrontmatter.includeLinks);
        expect(result.showRelatedPRs).toBe(fullValidFrontmatter.showRelatedPRs);
    });

    // ==== Required Fields ====

    test("Fail when title is missing", () => {
        const data = { date: "2025-02-18", authors: ["jathurchan"] };
        expect(() => parseMarkdownFrontmatter(data)).toThrow(
            /Missing required field 'title'/
        );
    });

    test("Fail when date is missing", () => {
        const data = { title: "Test Title", authors: ["jathurchan"] };
        expect(() => parseMarkdownFrontmatter(data)).toThrow(
            /Missing required field 'date'/
        );
    }); 

    test("Fail when authors is missing", () => {
        const data = { title: "Test Title", date: "2025-02-18" };
        expect(() => parseMarkdownFrontmatter(data)).toThrow(
            /Missing required field 'authors'/
        );
    });

    test("Fail when title is not a string", () => {
        const data = { title: 123, date: "2025-02-18", authors: ["jathurchan"] };
        expect(() => parseMarkdownFrontmatter(data)).toThrow(
            /Expected type 'string'/
        );
    });

    test("Fail when title is an empty string", () => {
        const data = { title: "", date: "2025-02-18", authors: ["jathurchan"] };
        expect(() => parseMarkdownFrontmatter(data)).toThrow(
            /title.*cannot be empty/
        );
    });

    test("Fail when title contains only whitespace", () => {
        const data = { title: "   ", date: "2025-02-18", authors: ["jathurchan"] };
        expect(() => parseMarkdownFrontmatter(data)).toThrow(
            /title.*cannot.*contain only whitespace/
        );
    });

    test("Fail when date is not a string", () => {
        const data = { title: "Test Title", date: 20230101, authors: ["jathurchan"] };
        expect(() => parseMarkdownFrontmatter(data)).toThrow(
            /Expected type 'string'/
        );
    });

    test("Fail when date is not a valid date string", () => {
        const data = { title: "Test Title", date: "invalid-date", authors: ["jathurchan"] };
        expect(() => parseMarkdownFrontmatter(data)).toThrow(
            /Invalid format 'date'/
        );
    });

    test("Fail when authors is not an array", () => {
        const data = { title: "Test Title", date: "2025-02-18", authors: "jathurchan" };
        expect(() => parseMarkdownFrontmatter(data)).toThrow(
            /Expected type 'array'/
        );
    });

    test("Fail when authors is empty", () => {
        const data = { title: "Test Title", date: "2025-02-18", authors: [] };
        expect(() => parseMarkdownFrontmatter(data)).toThrow(
            /Array must have at least/
        );
    });

    test("Fail when authors contains non-string elements", () => {
        const data = { title: "Test Title", date: "2025-02-18", authors: [123] };
        expect(() => parseMarkdownFrontmatter(data)).toThrow(
            /Expected type 'string'/
        );
    });

    // ==== Unexpected Fields ====

    test("Fail when additional field is present", () => {
        const data = {
            ...minimalValidFrontmatter,
            unexpectedField: "not allowed",
        };
        expect(() => parseMarkdownFrontmatter(data)).toThrow(
            /Unexpected field 'unexpectedField'/
        );
    });

    // ==== Optional Fields ====

    test("Fail when intro is present and not a string", () => {
        const data = { ...minimalValidFrontmatter, intro: 123 };
        expect(() => parseMarkdownFrontmatter(data)).toThrow(
            /Expected type 'string'/
        );
    });

    test("Fail when allowTitleToDifferFromFilename is present and not a boolean", () => {
        const data = { ...minimalValidFrontmatter, allowTitleToDifferFromFilename: "yes" };
        expect(() => parseMarkdownFrontmatter(data)).toThrow(
            /Expected type 'boolean'/
        );
    });

    test("Fail when featuredVideo is not a string", () => {
        const data = { ...minimalValidFrontmatter, featuredVideo: 12345 };
        expect(() => parseMarkdownFrontmatter(data)).toThrow(
            /Expected type 'string'/
        );
    });

    test("Fail when featuredVideo is not a valid url string", () => {
        const data = { ...minimalValidFrontmatter, featuredVideo: "not-a-url" };
        expect(() => parseMarkdownFrontmatter(data)).toThrow(
            /Invalid format 'uri'/
        );
    });

    test("Fail when projects is not an array", () => {
        const data = { ...minimalValidFrontmatter, projects: "project1" };
        expect(() => parseMarkdownFrontmatter(data)).toThrow(
            /Expected type 'array'/
        );
    });

    test("Fail when projects contains non-string elements", () => {
        const data = { ...minimalValidFrontmatter, projects: [123] };
        expect(() => parseMarkdownFrontmatter(data)).toThrow(
            /Expected type 'string'/
        );
    });

    
    test("Fail when skills is not an array", () => {
        const data = { ...minimalValidFrontmatter, skills: "skill1" };
        expect(() => parseMarkdownFrontmatter(data)).toThrow(
            /Expected type 'array'/
        );
    });

    test("Fail when skills contains non-string elements", () => {
        const data = { ...minimalValidFrontmatter, skills: [123] };
        expect(() => parseMarkdownFrontmatter(data)).toThrow(
            /Expected type 'string'/
        );
    });

    test("Fail when includeLinks is not an array", () => {
        const data = { ...minimalValidFrontmatter, includeLinks: "link" };
    expect(() => parseMarkdownFrontmatter(data)).toThrow(
        /Expected type 'array'/
    );
    });

    test("Fail when includeLinks contains non-string elements", () => {
        const data = { ...minimalValidFrontmatter, includeLinks: [123] };
        expect(() => parseMarkdownFrontmatter(data)).toThrow(
            /Expected type 'string'/
        );
    });

    test("Fail when showRelatedPRs is not a boolean", () => {
        const data = { ...minimalValidFrontmatter, showRelatedPRs: "yes" };
        expect(() => parseMarkdownFrontmatter(data)).toThrow(
            /Expected type 'boolean'/
        );
    });
});