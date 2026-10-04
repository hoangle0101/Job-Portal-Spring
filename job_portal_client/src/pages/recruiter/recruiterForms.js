// Chuyển đổi dữ liệu giữa API và form của trang Nhà tuyển dụng

export const emptyJobForm = {
  companyId: '', industryId: '', jobTypeId: '', title: '', salaryRange: '',
  responsibilities: '', requirements: '', benefits: '', status: 'OPEN',
};

export const emptyCompanyForm = {
  name: '', website: '', description: '', logoUrl: '', locations: [{ address: '', city: 'Hà Nội' }],
};

// Tin tuyển dụng (JobListingResponse) -> giá trị form
export const jobToForm = (job) => ({
  companyId: job.companyId,
  industryId: job.industryId || '',
  jobTypeId: job.jobTypeId || '',
  title: job.title,
  salaryRange: job.salaryRange || '',
  responsibilities: job.description?.responsibilities || '',
  requirements: job.description?.requirements || '',
  benefits: job.description?.benefits || '',
  status: job.status,
});

// Giá trị form -> request gửi backend (id rỗng -> null = "không chọn")
export const toJobPayload = (form) => ({
  companyId: Number(form.companyId),
  industryId: form.industryId ? Number(form.industryId) : null,
  jobTypeId: form.jobTypeId ? Number(form.jobTypeId) : null,
  title: form.title,
  salaryRange: form.salaryRange,
  responsibilities: form.responsibilities,
  requirements: form.requirements,
  benefits: form.benefits,
  status: form.status,
});

// Công ty (CompanyResponse) -> giá trị form
export const companyToForm = (company) => ({
  name: company.name,
  website: company.website || '',
  description: company.description || '',
  logoUrl: company.logoUrl || '',
  locations: company.locations.map((l) => ({ address: l.address, city: l.city })),
});
