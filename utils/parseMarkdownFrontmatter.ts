// utils/parseMarkdownFrontmatter.ts

import Ajv, { ErrorObject, ValidateFunction } from "ajv";
import addFormats from "ajv-formats"
import { Frontmatter } from "../types/frontmatter";

const ajv = new Ajv({
    allErrors: true,    // Report all validation errors, not just the first
    strict: true,       // Prevent unknown keywords, restrict types...
    useDefaults: true,  // Replace missing or undefined properties with defaults
});
addFormats(ajv);    // Add formats like data and uri

const frontmatterSchema = {
    type: 'object',
    properties: {
        title: {
            type: 'string',
            pattern: '\\S', // Ensures contains at least 1 non-whitespace character
        },
        intro: { type: "string" },
        allowTitleToDifferFromFilename: { type: "boolean", default: false },
        date: { type: 'string', format: 'date' },
        authors: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,    // Ensure at least one author
        },
        featuredVideo: { type: 'string', format: 'uri' },
        projects: {
            type: 'array',
            items: { type: 'string' },
            default: [],
        },
        skills: {
            type: 'array',
            items: { type: 'string' },
            default: [],
        },
        includeLinks: {
            type: 'array',
            items: { type: 'string' },
            default: [],
        },
        showRelatedPRs: { type: 'boolean', default: true },
    },
    required: ['title', 'date', 'authors'],
    additionalProperties: false, // Reject any unexpected field
};

const validateFrontmatter = ajv.compile<Frontmatter>(frontmatterSchema);

/**
 * Format a single validation error.
 */
export function formatValidationError(error: ErrorObject): string {
    let message = `${error.instancePath} ${error.message}`;

    switch (error.keyword) {
        case 'required':
            message += `: Missing required field '${error.params.missingProperty}'`;
            break;
        case 'type':
            message += `: Expected type '${error.params.type}'`;
            break;
        case 'additionalProperties':
            message += `: Unexpected field '${error.params.additionalProperty}'`;
            break;
        case 'format':
            message += `: Invalid format '${error.params.format}'`;
            break;
        case 'minItems':
            message += `: Array must have at least ${error.params.limit} item(s)`;
            break;
        case 'pattern':
            if (error.instancePath === '/title') {
                message += `: Title cannot be empty or contain only whitespace`;
                break;
            }
        default:
            message += ` (Keyword: ${error.keyword})`;
    }

    return message;
}

/**
 * Get formatted validation errors. 
 */
export function getValidationErrors(validator: ValidateFunction): string[] {
    const errors = validateFrontmatter.errors || [];
    return errors.map(formatValidationError);
}


export function parseMarkdownFrontmatter(data: unknown): Frontmatter {
    if (!validateFrontmatter(data)) {
        const errorMessages = getValidationErrors(validateFrontmatter);
        throw new Error(`Frontmatter validation failed:\n${errorMessages.join('\n')}`);
    }

    const fm = data as Record<string, unknown>;

    return {
        title: fm.title as string,
        intro: fm.intro as string | undefined,
        allowTitleToDifferFromFilename:
            fm.allowTitleToDifferFromFilename as boolean,
        date: new Date(fm.date as string),
        authors: fm.authors as [string, ...string[]],
        featuredVideo: fm.featuredVideo
            ? new URL(fm.featuredVideo as string)
            : undefined,
        projects: fm.projects as string[],
        skills: fm.skills as string[],
        includeLinks: fm.includeLinks as string[],  // TODO (108): enforce link formats
        showRelatedPRs: fm.showRelatedPRs as boolean,
    }
}
