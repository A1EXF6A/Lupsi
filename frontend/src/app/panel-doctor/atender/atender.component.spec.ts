import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AtenderComponent } from './atender.component';

describe('AtenderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtenderComponent, HttpClientTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AtenderComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('parses vitals JSON', () => {
    const fixture = TestBed.createComponent(AtenderComponent);
    const component = fixture.componentInstance;

    component.vitalsRaw = '{"peso":"70kg","presion":"120/80"}';
    expect(component.parseVitals()).toEqual({ peso: '70kg', presion: '120/80' });

    component.vitalsRaw = '{invalid';
    expect(component.parseVitals()).toBeNull();
  });

  it('adds medications when fields are complete', () => {
    const fixture = TestBed.createComponent(AtenderComponent);
    const component = fixture.componentInstance;

    component.medications = [{ id: 'm1', name: 'Paracetamol', description: '' }];
    component.medicationSelection = 'm1';
    component.medicationForm = {
      dosage: '500mg',
      frequency: 'cada 8h',
      duration: '5 dias',
    };

    component.addMedication();

    expect(component.prescriptionMedications).toHaveLength(1);
    expect(component.prescriptionMedications[0].name).toBe('Paracetamol');
  });
});
