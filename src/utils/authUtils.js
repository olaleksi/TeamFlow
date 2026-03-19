/**
 * Logic to determine if a requester can access a specific resource.
 *  requester - The user object from the JWT (id, email, role).
 * targetEmail - The email of the account being accessed.
    * Returns true if the requester is an ADMIN or if they are accessing their own account.
 */
export async function hasAccess(requester, targetEmail) {
    // Rule: You must be an ADMIN OR the email must match your own.
    return requester.role === "ADMIN" || requester.email === targetEmail;
}