import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BengkelCard from '../BengkelCard';
import type { Bengkel } from '../../types/api';

const mockBengkel: Bengkel = {
  bengkel_id: '1',
  bengkel_name: 'Test Bengkel',
  bengkel_phone: '08123456789',
  is_open: true,
  home_service: true,
  store_service: true,
  jumlah_montir: 3,
  addresses: [{ id: 1, address_label: 'Main', full_address: 'Jl. Test No. 123', latitude: 0, longitude: 0, note: '' }],
  services: [{ id: 1, nama_service: 'Ganti Oli', description: 'Oil change', price: 50000, is_available: true }],
  photos: [],
  operasionals: [],
  avatar_url: '',
  mitra_id: '1',
  created_at: '',
  updated_at: '',
} as Bengkel;

describe('BengkelCard', () => {
  it('renders bengkel name and phone', () => {
    render(
      <MemoryRouter>
        <BengkelCard bengkel={mockBengkel} />
      </MemoryRouter>
    );
    expect(screen.getByText('Test Bengkel')).toBeInTheDocument();
    expect(screen.getByText('08123456789')).toBeInTheDocument();
  });

  it('shows open status when bengkel is open', () => {
    render(
      <MemoryRouter>
        <BengkelCard bengkel={mockBengkel} />
      </MemoryRouter>
    );
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('shows closed status when bengkel is closed', () => {
    render(
      <MemoryRouter>
        <BengkelCard bengkel={{ ...mockBengkel, is_open: false }} />
      </MemoryRouter>
    );
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('shows service count', () => {
    render(
      <MemoryRouter>
        <BengkelCard bengkel={mockBengkel} />
      </MemoryRouter>
    );
    expect(screen.getByText('1 services available')).toBeInTheDocument();
  });

  it('links to bengkel detail page', () => {
    render(
      <MemoryRouter>
        <BengkelCard bengkel={mockBengkel} />
      </MemoryRouter>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/bengkels/1');
  });
});
