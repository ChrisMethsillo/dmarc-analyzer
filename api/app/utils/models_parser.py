# from models.dmarc_report import AuthResult, Identifiers, PolicyPublished, Record, Row
# def parse_metadata(report_dict: dict):
#     # Extraer información del report_metadata si existe
#     report_metadata = report_dict.pop("report_metadata", {})
#     report_dict["org_name"] = report_metadata.get("org_name", "")
#     report_dict["report_id"] = report_metadata.get("report_id", "")
#     report_dict["email"] = report_metadata.get("email", "")
#     report_date_range = report_metadata.get("date_range", {})
#     report_dict["date_begin"] = report_date_range.get("begin", "")
#     report_dict["date_end"] = report_date_range.get("end", "")

#     # Parsear policy_published
#     policy_published = report_dict.pop("policy_published", {})
#     report_dict["policy_published"] = PolicyPublished(**policy_published)

#     # Parsear records
#     records = report_dict.pop("record", [])
#     parsed_records = []
#     for record in records:
#         parsed_record = parse_record(record)
#         parsed_records.append(parsed_record)
#     report_dict["record"] = parsed_records
    
#     return report_dict

# def parse_record(record_dict: dict):
#     row_data = record_dict.get("row", {})
#     identifiers_data = record_dict.get("identifiers", {})
#     auth_results_data = record_dict.get("auth_results", {})

#     row = Row(**row_data)
#     identifiers = Identifiers(**identifiers_data)
#     auth_results = AuthResult(**auth_results_data) if auth_results_data else None

#     return Record(row=row, identifiers=identifiers, auth_results=auth_results)