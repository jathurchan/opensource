// types/frontmatter.ts

export type Frontmatter = {
    /**
     * Title.
     * Required.
     */
    title: string;

    /**
     * Intro.
     * Optional.
     */
    intro?: string;

    /**
     * Indicates whether the `title` in the frontmatter can differ
     * from the `title` in the filename.
     * Optional. Default is `false`.
     */
    allowTitleToDifferFromFilename: boolean;

    /**
     * Date.
     * Required.
     */
    date: Date;

    /**
     * Array of authors (array of `id` of `Author`).
     * Required (with at least one author).
     */
    authors: [string, ...string[]];

    /**
     * YouTube video URL.
     * Optional.
     */
    featuredVideo?: URL;

    /**
     * Array of projects (array of `id` of `Project`).
     * Optional.
     */
    projects: string[];

    /**
     * Array of skills (array of `id` of `Skill`).
     * Optional.
     */
    skills: string[];  // (array of `id` of `Skill`)

    /**
     * Array of links (e.g. /content/YYYY-MM-DD-test.md).
     * Optional.
     */
    includeLinks: string[];

    /**
     * Indicates whether all PRs that include the content file
     * should be listed.
     * Optional. Default is `true`.
     */
    showRelatedPRs: boolean;
}