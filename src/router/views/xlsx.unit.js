import XLSX from './xlsx.vue'

describe('@views/xlsx', () => {
  it('is a valid view', () => {
    expect(XLSX).toBeAViewComponent()
  })

  it('renders an element', () => {
    const { element } = shallowMountView(XLSX)
    expect(element.textContent).toContain('Upload')
  })
})
