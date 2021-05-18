#ifndef INCLUDE_DUCKDB_WEB_JSON_TABLE_H_
#define INCLUDE_DUCKDB_WEB_JSON_TABLE_H_

#include <iostream>
#include <memory>
#include <string>

#include "arrow/record_batch.h"
#include "arrow/type.h"
#include "arrow/type_fwd.h"
#include "duckdb/common/arrow.hpp"
#include "duckdb/web/io/ifstream.h"
#include "duckdb/web/json_parser.h"
#include "duckdb/web/json_table_options.h"
#include "rapidjson/document.h"
#include "rapidjson/istreamwrapper.h"

namespace duckdb {
namespace web {
namespace json {

struct FileRange {
    size_t offset;
    size_t size;
};

struct TableType {
    /// The shape
    TableShape shape = TableShape::UNRECOGNIZED;
    /// The type
    std::shared_ptr<arrow::DataType> type = nullptr;
    /// The column boundaries
    std::unordered_map<std::string, FileRange> column_boundaries = {};
};

/// An table reader
class TableReader : public arrow::RecordBatchReader {
   protected:
    /// The batch size
    const size_t batch_size_ = 1024;
    /// The input file stream
    std::unique_ptr<io::InputFileStream> table_file_ = {};
    /// The table type
    TableType table_type_ = {};
    /// The schema
    std::shared_ptr<arrow::Schema> schema_ = nullptr;

    /// Table reader
    TableReader(std::unique_ptr<io::InputFileStream> table, TableType type, size_t batch_size);

   public:
    /// Virtual destructor
    virtual ~TableReader() = default;
    /// Access the schema
    virtual std::shared_ptr<arrow::Schema> schema() const override;
    /// Prepare the table reader for parsing
    virtual arrow::Status Prepare() = 0;
    /// Rewind the table reader
    virtual arrow::Status Rewind() = 0;

    /// Create a table reader
    static arrow::Result<std::shared_ptr<TableReader>> Resolve(std::unique_ptr<io::InputFileStream> table,
                                                               TableType type, size_t batch_size = 1024);
    /// Arrow array stream factory function
    static ArrowArrayStream* CreateArrayStreamFromSharedPtrPtr(uintptr_t this_ptr);
};

}  // namespace json
}  // namespace web
}  // namespace duckdb

#endif
