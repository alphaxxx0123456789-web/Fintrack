import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marque une route comme publique (pas de JWT requis).
 * Utilisation : @Public() sur login/register.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
