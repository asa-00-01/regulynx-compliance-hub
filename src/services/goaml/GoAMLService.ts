
import { SAR } from '@/types/sar';
import { format } from 'date-fns';

export class GoAMLService {
  public static generateGoAMLXml(sar: SAR): string {
    const reportDate = format(new Date(), 'yyyy-MM-dd');
    const activityDate = format(new Date(sar.dateOfActivity), 'yyyy-MM-dd');

    // Basic XML escaping
    const escapeXml = (unsafe: string) => {
        if (!unsafe) return '';
        return unsafe.replace(/[<>&'"]/g, (c) => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
                default: return c;
            }
        });
    };

    const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
<report xmlns="http://www.un.org/fiu/goaml/report.xsd">
  <rentity_id>DEMO_BANK</rentity_id>
  <submission_code>E</submission_code>
  <report_code>STR</report_code>
  <entity_reference>${escapeXml(sar.id)}</entity_reference>
  <submission_date>${reportDate}</submission_date>
  <reason_for_report>${escapeXml(sar.summary)}</reason_for_report>

  <transaction>
    <transaction_number>${escapeXml(sar.transactions[0] || 'N/A')}</transaction_number>
    <transaction_date>${activityDate}</transaction_date>
    <amount_total>0</amount_total> 
    <currency_code_total>SEK</currency_code_total>
    <transaction_type>UNKNOWN</transaction_type>
  </transaction>

  <from_person>
    <person>
      <first_name>${escapeXml(sar.userName.split(' ')[0])}</first_name>
      <last_name>${escapeXml(sar.userName.split(' ').slice(1).join(' '))}</last_name>
      <id_number>${escapeXml(sar.userId)}</id_number>
    </person>
  </from_person>

  <report_indicators>
    <indicator>T16</indicator> 
  </report_indicators>
  
  <comments>${sar.notes ? escapeXml(sar.notes.join('\\n')) : ''}</comments>
</report>`;

    return xmlString;
  }
}
