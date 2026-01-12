//Controller
import * as api from './notices.api.js';
import { validateNotice } from './notices.schema.js';

export const loadActiveNotices = async () => {
  return await api.getActiveNotices();
};

export const createNewNotice = async (notice) => {
  if (!validateNotice(notice)) throw new Error('Datos inválidos');
  await api.createNotice(notice);
};

export const loadAdminNotices = async () => {
  return await api.getAllNotices();
};
